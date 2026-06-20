# --- 写真ストレージバケット ---
resource "google_storage_bucket" "photos" {
  name     = "${var.project_name}-photos"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = false
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type", "Cache-Control"]
    max_age_seconds = 3600
  }
}

# --- Cloud Run サービスアカウントに読み書き権限 ---
resource "google_storage_bucket_iam_member" "cloud_run_access" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_sa}"
}

# --- 高画素オリジナル用 非公開バケット（会員DL専用） ---
# photos バケットは allUsers 読み取りが付いて全公開のため、解錠ゲートを
# 効かせる原本はここに保存し、解錠後の署名 URL でのみ配信する（allUsers は付与しない）。
resource "google_storage_bucket" "originals" {
  name     = "${var.project_name}-originals"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = false
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}

resource "google_storage_bucket_iam_member" "originals_cloud_run_access" {
  bucket = google_storage_bucket.originals.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_sa}"
}

# --- CDN 用にパブリック読み取り許可 ---
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# --- Cloud CDN バックエンドバケット ---
resource "google_compute_backend_bucket" "photos_cdn" {
  name        = "${var.project_name}-photos-cdn"
  bucket_name = google_storage_bucket.photos.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    default_ttl       = 86400
    max_ttl           = 604800
    client_ttl        = 86400
    serve_while_stale = 86400
  }
}

# --- URL マップ (CDN エンドポイント) ---
resource "google_compute_url_map" "photos_cdn" {
  name            = "${var.project_name}-photos-cdn"
  default_service = google_compute_backend_bucket.photos_cdn.id
}

# --- HTTP プロキシ ---
resource "google_compute_target_http_proxy" "photos_cdn" {
  name    = "${var.project_name}-photos-cdn"
  url_map = google_compute_url_map.photos_cdn.id
}

# --- グローバル転送ルール (CDN の外部 IP) ---
resource "google_compute_global_address" "photos_cdn" {
  name = "${var.project_name}-photos-cdn"
}

resource "google_compute_global_forwarding_rule" "photos_cdn" {
  name       = "${var.project_name}-photos-cdn"
  target     = google_compute_target_http_proxy.photos_cdn.id
  port_range = "80"
  ip_address = google_compute_global_address.photos_cdn.address
}
