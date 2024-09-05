# ref: https://zenn.dev/maretol/articles/d68bf92c76d0ba
# ref: https://firebase.google.com/docs/projects/terraform/get-started?hl=ja#resources-authentication
resource "google_identity_platform_config" "default" {
  project                    = data.google_project.current.project_id
  autodelete_anonymous_users = true

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }

  authorized_domains = [
    "localhost",
    # "my-project.firebaseapp.com",
    # "my-project.web.app",
  ]
}
