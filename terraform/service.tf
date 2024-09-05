resource "google_project_service" "default" {
  for_each = toset([
    # for terraform state bucket
    "storage.googleapis.com",
    # for idp auth
    "identitytoolkit.googleapis.com",
    # https://firebase.google.com/docs/projects/terraform/get-started
    "cloudbilling.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firebase.googleapis.com",
    "serviceusage.googleapis.com", # Enabling the ServiceUsage API allows the new project to be quota checked from now on.
  ])

  project = var.project_id
  service = each.value

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}
