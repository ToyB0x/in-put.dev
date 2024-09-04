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
}

