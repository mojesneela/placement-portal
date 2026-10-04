from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = "placement.db"


# =========================
# DATABASE CONNECTION
# =========================

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# =========================
# DATABASE INITIALIZATION
# =========================

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # USERS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    # JOBS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            skills TEXT NOT NULL,
            description TEXT,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    """)

    # APPLICATIONS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            job_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'Applied',
            applied_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (job_id) REFERENCES jobs(id)
        )
    """)

    # Check whether created_by already exists
    cursor.execute("PRAGMA table_info(jobs)")
    columns = [column["name"] for column in cursor.fetchall()]

    if "created_by" not in columns:
        cursor.execute("""
            ALTER TABLE jobs
            ADD COLUMN created_by INTEGER
        """)

    # Add sample jobs if database is empty
    cursor.execute(
        "SELECT COUNT(*) AS count FROM jobs"
    )

    job_count = cursor.fetchone()["count"]

    if job_count == 0:

        sample_jobs = [
            (
                "Frontend Developer",
                "Tech Solutions",
                "Hyderabad",
                "HTML, CSS, JavaScript, React",
                "Build and maintain modern web applications."
            ),
            (
                "Backend Developer",
                "Software Systems Ltd.",
                "Bangalore",
                "Python, Flask, SQL, REST API",
                "Develop and maintain backend applications and REST APIs."
            ),
            (
                "Full Stack Developer",
                "Innovate Technologies",
                "Chennai",
                "React, Python, Flask, SQL",
                "Work on complete web application development."
            )
        ]

        cursor.executemany("""
            INSERT INTO jobs
            (title, company, location, skills, description)
            VALUES (?, ?, ?, ?, ?)
        """, sample_jobs)

    conn.commit()
    conn.close()


# =========================
# HOME
# =========================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Placement Portal API is running"
    })


# =========================
# REGISTER
# =========================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    if role not in ["student", "recruiter"]:
        return jsonify({
            "error": "Invalid role"
        }), 400

    conn = get_db_connection()

    existing_user = conn.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    if existing_user:
        conn.close()

        return jsonify({
            "error": "Email already registered"
        }), 409

    hashed_password = generate_password_hash(password)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)
    """, (
        name,
        email,
        hashed_password,
        role
    ))

    user_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Registration successful",
        "user_id": user_id
    }), 201


# =========================
# LOGIN
# =========================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    conn = get_db_connection()

    user = conn.execute("""
        SELECT
            id,
            name,
            email,
            password,
            role
        FROM users
        WHERE email = ?
    """, (email,)).fetchone()

    conn.close()

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not check_password_hash(
        user["password"],
        password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


# =========================
# GET ALL JOBS
# =========================

@app.route("/api/jobs", methods=["GET"])
def get_jobs():

    conn = get_db_connection()

    jobs = conn.execute("""
        SELECT
            jobs.id,
            jobs.title,
            jobs.company,
            jobs.location,
            jobs.skills,
            jobs.description,
            jobs.created_by,
            users.name AS recruiter_name
        FROM jobs
        LEFT JOIN users
        ON jobs.created_by = users.id
        ORDER BY jobs.id DESC
    """).fetchall()

    conn.close()

    return jsonify([
        dict(job)
        for job in jobs
    ])


# =========================
# GET SINGLE JOB
# =========================

@app.route("/api/jobs/<int:job_id>", methods=["GET"])
def get_job(job_id):

    conn = get_db_connection()

    job = conn.execute("""
        SELECT
            jobs.id,
            jobs.title,
            jobs.company,
            jobs.location,
            jobs.skills,
            jobs.description,
            jobs.created_by,
            users.name AS recruiter_name
        FROM jobs
        LEFT JOIN users
        ON jobs.created_by = users.id
        WHERE jobs.id = ?
    """, (job_id,)).fetchone()

    conn.close()

    if not job:
        return jsonify({
            "error": "Job not found"
        }), 404

    return jsonify(dict(job))


# =========================
# ADD JOB
# =========================

@app.route("/api/jobs", methods=["POST"])
def add_job():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    title = data.get("title")
    company = data.get("company")
    location = data.get("location")
    skills = data.get("skills")
    description = data.get("description", "")
    created_by = data.get("created_by")

    if not title or not company or not location or not skills:
        return jsonify({
            "error": "Title, company, location and skills are required"
        }), 400

    if not created_by:
        return jsonify({
            "error": "Recruiter ID is required"
        }), 400

    conn = get_db_connection()

    recruiter = conn.execute("""
        SELECT id
        FROM users
        WHERE id = ?
        AND role = 'recruiter'
    """, (created_by,)).fetchone()

    if not recruiter:
        conn.close()

        return jsonify({
            "error": "Invalid recruiter"
        }), 403

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO jobs
        (
            title,
            company,
            location,
            skills,
            description,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        title,
        company,
        location,
        skills,
        description,
        created_by
    ))

    job_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Job added successfully",
        "job_id": job_id
    }), 201


# =========================
# UPDATE JOB
# =========================

@app.route("/api/jobs/<int:job_id>", methods=["PUT"])
def update_job(job_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    title = data.get("title")
    company = data.get("company")
    location = data.get("location")
    skills = data.get("skills")
    description = data.get("description", "")

    if not title or not company or not location or not skills:
        return jsonify({
            "error": "Title, company, location and skills are required"
        }), 400

    conn = get_db_connection()

    existing_job = conn.execute(
        """
        SELECT id
        FROM jobs
        WHERE id = ?
        """,
        (job_id,)
    ).fetchone()

    if not existing_job:
        conn.close()

        return jsonify({
            "error": "Job not found"
        }), 404

    conn.execute("""
        UPDATE jobs
        SET
            title = ?,
            company = ?,
            location = ?,
            skills = ?,
            description = ?
        WHERE id = ?
    """, (
        title,
        company,
        location,
        skills,
        description,
        job_id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Job updated successfully"
    })


# =========================
# DELETE JOB
# =========================

@app.route("/api/jobs/<int:job_id>", methods=["DELETE"])
def delete_job(job_id):

    conn = get_db_connection()

    existing_job = conn.execute(
        """
        SELECT id
        FROM jobs
        WHERE id = ?
        """,
        (job_id,)
    ).fetchone()

    if not existing_job:
        conn.close()

        return jsonify({
            "error": "Job not found"
        }), 404

    # Delete applications associated with the job
    conn.execute("""
        DELETE FROM applications
        WHERE job_id = ?
    """, (job_id,))

    # Delete the job
    conn.execute("""
        DELETE FROM jobs
        WHERE id = ?
    """, (job_id,))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Job deleted successfully"
    })


# =========================
# APPLY FOR JOB
# =========================

@app.route("/api/applications", methods=["POST"])
def apply_for_job():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    student_id = data.get("student_id")
    job_id = data.get("job_id")

    if not student_id or not job_id:
        return jsonify({
            "error": "Student ID and Job ID are required"
        }), 400

    conn = get_db_connection()

    # Check student
    student = conn.execute("""
        SELECT id
        FROM users
        WHERE id = ?
        AND role = 'student'
    """, (student_id,)).fetchone()

    if not student:
        conn.close()

        return jsonify({
            "error": "Student not found"
        }), 404

    # Check job
    job = conn.execute("""
        SELECT id
        FROM jobs
        WHERE id = ?
    """, (job_id,)).fetchone()

    if not job:
        conn.close()

        return jsonify({
            "error": "Job not found"
        }), 404

    # Prevent duplicate applications
    existing_application = conn.execute("""
        SELECT id
        FROM applications
        WHERE student_id = ?
        AND job_id = ?
    """, (
        student_id,
        job_id
    )).fetchone()

    if existing_application:
        conn.close()

        return jsonify({
            "error": "You have already applied for this job"
        }), 409

    applied_at = datetime.now().isoformat()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO applications
        (
            student_id,
            job_id,
            status,
            applied_at
        )
        VALUES (?, ?, ?, ?)
    """, (
        student_id,
        job_id,
        "Applied",
        applied_at
    ))

    application_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Application submitted successfully",
        "application_id": application_id
    }), 201


# =========================
# GET ALL APPLICATIONS
# =========================

@app.route("/api/applications", methods=["GET"])
def get_applications():

    conn = get_db_connection()

    applications = conn.execute("""
        SELECT
            applications.id,
            applications.student_id,
            users.name AS student_name,
            users.email AS student_email,
            applications.job_id,
            jobs.title AS job_title,
            jobs.company,
            jobs.location,
            jobs.created_by,
            applications.status,
            applications.applied_at
        FROM applications
        JOIN users
        ON applications.student_id = users.id
        JOIN jobs
        ON applications.job_id = jobs.id
        ORDER BY applications.id DESC
    """).fetchall()

    conn.close()

    return jsonify([
        dict(application)
        for application in applications
    ])


# =========================
# GET STUDENT APPLICATIONS
# =========================

@app.route(
    "/api/applications/student/<int:student_id>",
    methods=["GET"]
)
def get_student_applications(student_id):

    conn = get_db_connection()

    applications = conn.execute("""
        SELECT
            applications.id,
            applications.job_id,
            jobs.title AS job_title,
            jobs.company,
            jobs.location,
            applications.status,
            applications.applied_at
        FROM applications
        JOIN jobs
        ON applications.job_id = jobs.id
        WHERE applications.student_id = ?
        ORDER BY applications.id DESC
    """, (student_id,)).fetchall()

    conn.close()

    return jsonify([
        dict(application)
        for application in applications
    ])


# =========================
# UPDATE APPLICATION STATUS
# =========================

@app.route(
    "/api/applications/<int:application_id>",
    methods=["PUT"]
)
def update_application_status(application_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    status = data.get("status")

    allowed_statuses = [
        "Applied",
        "Shortlisted",
        "Selected",
        "Rejected"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid application status"
        }), 400

    conn = get_db_connection()

    existing_application = conn.execute("""
        SELECT id
        FROM applications
        WHERE id = ?
    """, (application_id,)).fetchone()

    if not existing_application:
        conn.close()

        return jsonify({
            "error": "Application not found"
        }), 404

    conn.execute("""
        UPDATE applications
        SET status = ?
        WHERE id = ?
    """, (
        status,
        application_id
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Application status updated successfully"
    })


# =========================
# INITIALIZE DATABASE
# =========================

# Important for Render/Gunicorn:
# Gunicorn imports this file instead of running it
# as the main Python program.
init_db()


# =========================
# RUN SERVER LOCALLY
# =========================

if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )