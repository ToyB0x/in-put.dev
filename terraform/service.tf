resource "google_project_service" "service" {
  for_each = toset([
    "storage.googleapis.com", // for terraform state bucket
  ])

  project = var.project_id
  service = each.value
}
