class AddPictureToTeam < ActiveRecord::Migration[5.1]
  def change
  	add_column :teams, :picture, :string
  end
end
