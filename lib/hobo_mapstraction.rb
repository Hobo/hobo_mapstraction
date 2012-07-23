module HoboMapstraction

  @@root = Pathname.new File.expand_path('../..', __FILE__)
  def self.root; @@root; end

  EDIT_LINK_BASE = 'https://github.com/Hobo/hobo_mapstraction/edit/master'

  if defined?(Rails)
    require 'hobo_mapstraction/railtie'

    class Engine < ::Rails::Engine
    end
  end
end
