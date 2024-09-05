resource "google_project_service" "default" {
  for_each = toset([
    "storage.googleapis.com", // for terraform state bucket
    "identitytoolkit.googleapis.com", // for firebase auth
  ])

  project = var.project_id
  service = each.value
}
