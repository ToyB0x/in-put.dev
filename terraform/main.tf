terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.1.0"
    }
  }
  backend "gcs" {}
}

provider "google" {
  project = var.project_id
  # Configures the provider to use the resource block's specified project for quota checks.
  # https://firebase.google.com/docs/projects/terraform/get-started?hl=ja#resources-authentication
  # https://zenn.dev/maretol/articles/d68bf92c76d0ba
  user_project_override = true
}

data "google_project" "current" {}
