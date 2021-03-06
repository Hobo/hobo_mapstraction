$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "hobo_mapstraction/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "hobo_mapstraction"
  s.version     = HoboMapstraction::VERSION
  s.authors     = ["Bryan Larsen"]
  s.email       = ["bryan@larsen.st"]
  s.homepage    = "http://cookbook.hobocentral.net"
  s.summary     = "Hobo wrapper for Mapstraction."
  s.description = "Hobo wrapper for mapstraction."

  s.test_files = Dir["test/**/*"]

  s.files = `git ls-files -z`.split(' ')
  s.add_runtime_dependency('hobo', ['> 1.4.0.pre6'])
end
