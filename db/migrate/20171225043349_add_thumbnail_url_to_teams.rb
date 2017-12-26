class AddThumbnailUrlToTeams < ActiveRecord::Migration[5.1]
  def change
  	add_column :teams, :thumbnail_url, :string
  end
end
