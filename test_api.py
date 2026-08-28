import requests
import time

BASE_URL = "http://127.0.0.1:8005"

def run_tests():
    print("Testing User Module APIs...")

    # 1. Register User
    print("1. Registering user...")
    register_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    r = requests.post(f"{BASE_URL}/api/user/register", json=register_data)
    if r.status_code == 201:
        print("   Success")
    elif r.status_code == 400 and "already registered" in r.text:
        print("   User already exists, continuing")
    else:
        print("   Failed:", r.text)

    # 2. Login
    print("2. Logging in...")
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    r = requests.post(f"{BASE_URL}/api/user/login", data=login_data)
    if r.status_code == 200:
        print("   Success")
        token = r.json().get("access_token")
    else:
        print("   Failed:", r.text)
        return
    
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Profile
    print("3. Fetching profile...")
    r = requests.get(f"{BASE_URL}/api/user/profile", headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    # 4. Get Preferences
    print("4. Fetching preferences...")
    r = requests.get(f"{BASE_URL}/api/user/preferences", headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    # 5. Update Preferences
    print("5. Updating preferences...")
    prefs_update = {"daily_hours": 4.5}
    r = requests.put(f"{BASE_URL}/api/user/preferences", json=prefs_update, headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    # 6. Get Progress
    print("6. Fetching progress...")
    r = requests.get(f"{BASE_URL}/api/user/progress", headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    # --- Syllabus Tests ---
    print("S1. Adding Subject...")
    r = requests.post(f"{BASE_URL}/api/syllabus/subjects", json={"subject_name": "Mathematics"}, headers=headers)
    if r.status_code == 201:
        print("   Success:", r.json())
        subject_id = r.json().get("subject_id")
    else:
        print("   Failed:", r.text)

    print("S2. Adding Topic to Subject...")
    r = requests.post(
        f"{BASE_URL}/api/syllabus/subjects/{subject_id}/topics",
        json={"topic_name": "Algebra", "difficulty_weight": 1.2, "estimated_hours": 3.0},
        headers=headers
    )
    if r.status_code == 201:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    print("S3. Adding Exam to Subject...")
    r = requests.post(
        f"{BASE_URL}/api/syllabus/subjects/{subject_id}/exams",
        json={"exam_date": "2026-12-15"},
        headers=headers
    )
    if r.status_code == 201:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    # --- Planning Tests ---
    print("P1. Generating Timetable...")
    # Exam date needs to be in the future, let's use the one we created (2026-12-15)
    r = requests.post(f"{BASE_URL}/api/planning/generate/{subject_id}", headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    print("P2. Fetching Timetable...")
    r = requests.get(f"{BASE_URL}/api/planning/timetable", headers=headers)
    if r.status_code == 200:
        plans = r.json()
        print(f"   Success: Found {len(plans)} study sessions.")
        if plans:
            plan_id = plans[0]["plan_id"]
            
            print("P3. Completing Study Session...")
            r2 = requests.put(f"{BASE_URL}/api/planning/sessions/{plan_id}/complete", headers=headers)
            if r2.status_code == 200:
                print("   Success:", r2.json())
            else:
                print("   Failed:", r2.text)
    else:
        print("   Failed:", r.text)

    # --- AI Engine Tests ---
    print("A1. Generating AI Quiz...")
    # This might fail if Ollama is not running on localhost:11434, but that's expected.
    r = requests.post(f"{BASE_URL}/api/ai/quiz/generate/1", headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
        questions = r.json().get("questions", [])
        if questions:
            print("A2. Submitting Assessment...")
            payload = {
                "topic_id": 1,
                "answers": [
                    {
                        "question_id": questions[0]["question_id"],
                        "selected_option": questions[0]["correct_option"],
                        "response_time": 12.5,
                        "is_skipped": False
                    }
                ]
            }
            r2 = requests.post(f"{BASE_URL}/api/ai/assessment/submit", json=payload, headers=headers)
            if r2.status_code == 200:
                print("   Success:", r2.json())
            else:
                print("   Failed:", r2.text)
    else:
        print("   Failed (Check Ollama status):", r.text)

    # 7. Logout
    print("7. Logging out...")
    r = requests.post(f"{BASE_URL}/api/user/logout", headers=headers)
    if r.status_code == 200:
        print("   Success:", r.json())
    else:
        print("   Failed:", r.text)

    print("All tests completed.")

if __name__ == "__main__":
    # Wait a bit for server to start if running sequentially
    time.sleep(2)
    try:
        run_tests()
    except Exception as e:
        print("Error connecting to server:", e)
