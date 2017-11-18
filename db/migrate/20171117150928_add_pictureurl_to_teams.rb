class AddPictureurlToTeams < ActiveRecord::Migration[5.1]
  def change
  	add_column :teams, :picture_url, :string
  end
end
