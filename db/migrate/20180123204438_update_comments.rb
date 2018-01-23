class UpdateComments < ActiveRecord::Migration[5.1]
  def change
  	unless column_exists? :comments, :target_id
		  add_column :comments, :target_id, :id
		end
  	unless column_exists? :comments, :target_type
		  add_column :comments, :target_type, :string
		end
		if column_exists? :comments, :post_id
			remove_column :comments, :post_id
		end
  end
end

    	# t.belongs_to :user, foreign_key: true
    	# t.integer :target_id
    	# t.string :target_type
    	# t.string :text
     #  t.timestamps