class AddSlugs < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :slug, :string, unique: true
    add_column :teams, :slug, :string, unique: true
    add_column :posts, :slug, :string, unique: true
  end
end
