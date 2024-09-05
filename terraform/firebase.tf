# NOTE: to avoid below error, don't config via terraform (manually add settings in GCP console)
# > Error creating Config: googleapi: Error 403: Your application is authenticating by using local Application Default Credentials. The identitytoolkit.googleapis.com API requires a quota project, which is not set by default. To learn how to set your quota project, see https://cloud.google.com/docs/authentication/adc-troubleshooting/user-creds .
#
# resource "google_identity_platform_config" "default" {
#   project = data.google_project.current.project_id
#   autodelete_anonymous_users = true
#
#   sign_in {
#     allow_duplicate_emails = false
#
#     email {
#       enabled = true
#       password_required = true
#     }
#   }
#
#   authorized_domains = [
#     "localhost",
#     # "my-project.firebaseapp.com",
#     # "my-project.web.app",
#   ]
# }
