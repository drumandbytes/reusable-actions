# One provider, so opentofu-validate's init has something to download and its
# provider cache has something to cache.
terraform {
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

resource "null_resource" "fixture" {}
