class AddSlugToDebates < ActiveRecord::Migration[5.1]
  def change
  	unless column_exists? :debates, :slug
		  add_column :debates, :slug, :string
		end
  end
end
