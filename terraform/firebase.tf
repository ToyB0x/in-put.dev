resource "google_identity_platform_config" "default" {
  project = data.google_project.current.project_id
  autodelete_anonymous_users = true

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled = true
      password_required = true
    }
  }

  authorized_domains = [
    "localhost",
    # "my-project.firebaseapp.com",
    # "my-project.web.app",
  ]
}
