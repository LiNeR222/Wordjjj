variable "CI_REGISTRY_IMAGE" {
  
}

variable "TAG" {
  default = "latest"
}

target "default" {
  context = "."
  dockerfile = "Dockerfile"
  pull = true
  # push = true
  tags = ["${CI_REGISTRY_IMAGE}:${TAG}"]
  output = [
    "type=image,name=${CI_REGISTRY_IMAGE}:${TAG},push=true,registry.insecure=true"
  ]

  cache-from = [
    "type=registry,ref=${CI_REGISTRY_IMAGE}"
  ]
  cache-to = [
    "type=inline"
  ]
}

####