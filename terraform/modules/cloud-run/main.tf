resource "google_cloud_run_v2_service" "app" {
  name     = var.project_name
  location = var.region

  deletion_protection = false

  template {
    service_account = var.service_account

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.secret_env_vars
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }

      startup_probe {
        http_get {
          path = "/"
          port = var.container_port
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      dynamic "volume_mounts" {
        for_each = var.cloudsql_connection_name != "" ? [1] : []
        content {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }
    }

    dynamic "volumes" {
      for_each = var.cloudsql_connection_name != "" ? [1] : []
      content {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [var.cloudsql_connection_name]
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  # CD(deploy.yml/gcloud)と terraform が同じフィールドを奪い合わないようにする。
  # deploy.yml は image を :<github.sha>、revision labels(commit-sha 等)を、
  # gcloud/API は client 情報や service-level scaling を更新する。これらを
  # 管理対象から外すことで、terraform apply(ドメインマッピングの -target で
  # 本 service が依存に入るケース含む)が image を :latest に差し替えたり
  # commit-sha label を消す巻き添えを防ぐ。env/secret は引き続き terraform 管理。
  lifecycle {
    ignore_changes = [
      client,
      client_version,
      scaling,
      template[0].labels,
      template[0].containers[0].image,
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 独自ドメインのマッピング(追加課金なし・Google 自動SSL)。var.domain 指定時のみ。
# 前提: Search Console でドメイン所有権の確認を済ませること。apply 後、
# `terraform output domain_mapping_records` で得た A/AAAA(apex は CNAME 不可)を DNS に設定。
# SSL プロビジョニングは最大24時間。
resource "google_cloud_run_domain_mapping" "app" {
  count    = var.domain != "" ? 1 : 0
  name     = var.domain
  location = var.region

  metadata {
    namespace = var.project_id
  }
  spec {
    route_name = google_cloud_run_v2_service.app.name
  }
}
