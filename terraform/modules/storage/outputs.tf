output "bucket_name" {
  description = "Cloud Storage bucket name"
  value       = google_storage_bucket.photos.name
}

output "bucket_url" {
  description = "Cloud Storage bucket URL"
  value       = google_storage_bucket.photos.url
}

output "originals_bucket_name" {
  description = "高画素オリジナル用 非公開バケット名（会員DL専用）"
  value       = google_storage_bucket.originals.name
}

output "cdn_url" {
  description = "CDN endpoint URL"
  value       = "http://${google_compute_global_address.photos_cdn.address}"
}

output "cdn_ip" {
  description = "CDN global IP address"
  value       = google_compute_global_address.photos_cdn.address
}
