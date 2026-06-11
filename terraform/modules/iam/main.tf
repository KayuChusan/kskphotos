# =============================================================================
# Cloud Run 用サービスアカウント
# =============================================================================

resource "google_service_account" "cloud_run" {
  account_id   = "${var.project_name}-run"
  display_name = "${var.project_name} Cloud Run"
  description  = "Service account for ${var.project_name} Cloud Run service"
}

resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# =============================================================================
# CI/CD 用サービスアカウント
# =============================================================================

resource "google_service_account" "cicd" {
  account_id   = "${var.project_name}-cicd"
  display_name = "${var.project_name} CI/CD"
  description  = "Service account for GitHub Actions CI/CD"
}

resource "google_project_iam_member" "cicd_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

resource "google_project_iam_member" "cicd_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

resource "google_service_account_iam_member" "cicd_act_as_cloud_run" {
  service_account_id = google_service_account.cloud_run.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cicd.email}"
}

# ビルド時に ISR ページが DB を参照するため、CI から Cloud SQL Auth Proxy で接続する
resource "google_project_iam_member" "cicd_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

resource "google_secret_manager_secret_iam_member" "cicd_database_url" {
  secret_id = var.database_url_secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cicd.email}"
}

# =============================================================================
# Workload Identity Federation (GitHub Actions → GCP キーレス認証)
# =============================================================================

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "${var.project_name}-github"
  display_name              = "${var.project_name} GitHub"
  description               = "Workload Identity Pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "wif_cicd" {
  service_account_id = google_service_account.cicd.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}
