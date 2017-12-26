class CreateDebates < ActiveRecord::Migration[5.1]
  def change
    create_table :debates do |t|
    	  t.string :title
    	  t.string :description
    	  t.string :about
    	  t.belongs_to :team, foreign_key: true
      	t.timestamps
    end
  end
end
