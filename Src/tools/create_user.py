import os
import sys
import uuid

# Add Backend directory to sys.path so we can import its modules
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "Backend")
sys.path.insert(0, backend_dir)

try:
    from app import create_app
    from extensions import db
    from models import User
except ImportError as e:
    print(f"Failed to import backend modules: {e}")
    print(
        "Ensure you are running this script from the correct environment and the Backend is properly structured."
    )
    sys.exit(1)


def create_user(username, email, password, role):
    # Change working directory to Backend so DB path resolves correctly
    os.chdir(backend_dir)
    app = create_app()
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()

        if existing_user:
            print(
                f"[-] Error: User with username '{username}' or email '{email}' already exists."
            )
            sys.exit(1)

        # Determine if admin based on role input
        is_admin = role.lower() == "admin"

        # Generate a unique public_id
        public_id = uuid.uuid4().hex[:20]

        # Create user instance
        new_user = User(
            username=username, email=email, public_id=public_id, is_admin=is_admin
        )
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
            print(f"[+] Success: User '{username}' created successfully!")
            print(f"    Email: {email}")
            print(f"    Role: {role} (is_admin: {is_admin})")
            print(f"    Public ID: {public_id}")
        except Exception as e:
            db.session.rollback()
            print(f"[-] Error saving user to database: {e}")
            sys.exit(1)


if __name__ == "__main__":
    print("=== Create New User ===")
    username = input("Enter username: ").strip()
    email = input("Enter email: ").strip()
    password = input("Enter password: ").strip()

    while True:
        role = input("Enter role (admin/business/user) [user]: ").strip().lower()
        if not role:
            role = "user"

        if role in ["admin", "business", "user"]:
            break
        print("Invalid role. Please enter 'admin', 'business', or 'user'.")

    if username and email and password:
        create_user(username, email, password, role)
    else:
        print("[-] Error: Username, email, and password are required.")
