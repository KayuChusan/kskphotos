# =============================================================================
# モジュール呼び出し — GCP コスト最適化版 (~$10-22/月)
# Cloud SQL は kokumin-pedia 側が所有。接続情報は Secret Manager 経由。
# =============================================================================

# --- IAM (サービスアカウント + Workload Identity Federation) ---
module "iam" {
  source = "./modules/iam"

  project_id             = var.gcp_project_id
  project_name           = var.project_name
  github_repo            = "kskworks/kskphotos"
  database_url_secret_id = var.database_url_secret_id
}

# --- Artifact Registry ---
module "artifact_registry" {
  source = "./modules/artifact-registry"

  project_name = var.project_name
  region       = var.gcp_region
}

# --- Cloud Storage + CDN ---
module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  region       = var.gcp_region
  cloud_run_sa = module.iam.cloud_run_sa_email
}

# --- Cloud Run ---
module "cloud_run" {
  source = "./modules/cloud-run"

  project_id      = var.gcp_project_id
  project_name    = var.project_name
  region          = var.gcp_region
  image           = "${module.artifact_registry.repository_url}/${var.project_name}:latest"
  service_account = module.iam.cloud_run_sa_email
  cpu             = var.cloud_run_cpu
  memory          = var.cloud_run_memory
  max_instances   = var.cloud_run_max_instances
  min_instances   = var.cloud_run_min_instances
  container_port  = var.container_port
  domain          = var.domain

  cloudsql_connection_name = var.cloudsql_connection_name

  env_vars = {
    NODE_ENV             = "production"
    GCS_BUCKET_NAME      = module.storage.bucket_name
    GCS_ORIGINALS_BUCKET = module.storage.originals_bucket_name
    AUTH_TRUST_HOST      = "true"
    AUTH_URL             = var.auth_url
    ADMIN_EMAIL          = var.admin_email
    NOTIFICATION_EMAIL   = var.notification_email
    # Google ログイン確認済み(2026-06-19)につき封鎖。パスワードレス侵入の穴を塞ぐ。
    ALLOW_EMAIL_SIGNIN = "false"
  }

  # シークレット本体は Terraform 管理外 — デプロイ前に gcloud で作成すること
  # RESEND_API_KEY は enable_resend=true のときのみ参照(未作成での起動失敗を防ぐ)
  secret_env_vars = merge({
    DATABASE_URL       = var.database_url_secret_id
    AUTH_SECRET        = "kskphotos-auth-secret"
    AUTH_GOOGLE_ID     = "kskphotos-google-client-id"
    AUTH_GOOGLE_SECRET = "kskphotos-google-client-secret"
  }, var.enable_resend ? { RESEND_API_KEY = "kskphotos-resend-api-key" } : {})
}
