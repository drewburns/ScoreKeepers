class AddInfoToTeams < ActiveRecord::Migration[5.1]
  def change
  	add_column :teams, :coach, :string
  	add_column :teams, :frontoffice, :string
  	add_column :teams, :stdium, :string
  end
end
