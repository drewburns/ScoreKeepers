# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )


Rails.application.config.assets.precompile += %w( ContentTools/build/content-tools.min.css )
Rails.application.config.assets.precompile += %w( ContentTools/build/content-tools.css )
Rails.application.config.assets.precompile += %w( ContentTools/build/content-tools.js )
Rails.application.config.assets.precompile += %w( ContentEdit/build/content-edit.js )
Rails.application.config.assets.precompile += %w( editor.js )
Rails.application.config.assets.precompile += %w( editor.css )
Rails.application.config.assets.precompile += %w( foundation.js )
Rails.application.config.assets.precompile += %w( vendor/modernizr.js )
Rails.application.config.assets.precompile += %w( foundation_and_overrides.css )
Rails.application.config.assets.precompile += %w( foundation.css )
Rails.application.config.assets.precompile += %w( selectize/dist/css/selectize.css )
Rails.application.config.assets.precompile += %w( selectize/dist/css/selectize.default.css )
Rails.application.config.assets.precompile += %w( selectize/dist/js/standalone/selectize.min.js)



Rails.application.config.assets.precompile += %w( ContentEdit/build/content-edit.min.css )