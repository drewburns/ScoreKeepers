# -*- encoding: utf-8 -*-
# stub: activerecord-reputation-system 3.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "activerecord-reputation-system".freeze
  s.version = "3.0.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Katsuya Noguchi".freeze]
  s.date = "2014-11-27"
  s.description = "ActiveRecord Reputation System gem allows rails apps to compute and publish reputation scores for active record models.".freeze
  s.email = ["katsuya@twitter.com".freeze]
  s.homepage = "https://github.com/twitter/activerecord-reputation-system".freeze
  s.rubygems_version = "2.6.13".freeze
  s.summary = "ActiveRecord Reputation System gem allows rails apps to compute and publish reputation scores for active record models".freeze

  s.installed_by_version = "2.6.13" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<activerecord>.freeze, ["~> 4.0"])
      s.add_development_dependency(%q<rake>.freeze, [">= 0.8.7"])
      s.add_development_dependency(%q<rspec>.freeze, ["~> 2.8"])
      s.add_development_dependency(%q<rdoc>.freeze, [">= 0"])
      s.add_development_dependency(%q<database_cleaner>.freeze, ["~> 1.2.0"])
      s.add_development_dependency(%q<sqlite3>.freeze, ["~> 1.3.5"])
    else
      s.add_dependency(%q<activerecord>.freeze, ["~> 4.0"])
      s.add_dependency(%q<rake>.freeze, [">= 0.8.7"])
      s.add_dependency(%q<rspec>.freeze, ["~> 2.8"])
      s.add_dependency(%q<rdoc>.freeze, [">= 0"])
      s.add_dependency(%q<database_cleaner>.freeze, ["~> 1.2.0"])
      s.add_dependency(%q<sqlite3>.freeze, ["~> 1.3.5"])
    end
  else
    s.add_dependency(%q<activerecord>.freeze, ["~> 4.0"])
    s.add_dependency(%q<rake>.freeze, [">= 0.8.7"])
    s.add_dependency(%q<rspec>.freeze, ["~> 2.8"])
    s.add_dependency(%q<rdoc>.freeze, [">= 0"])
    s.add_dependency(%q<database_cleaner>.freeze, ["~> 1.2.0"])
    s.add_dependency(%q<sqlite3>.freeze, ["~> 1.3.5"])
  end
end
