class CreatePosts < ActiveRecord::Migration[5.1]
  def change
    create_table :posts do |t|
    	t.belongs_to :user, foreign_key: true
    	t.string :title
    	t.text :content
    	t.string :image_url
    	t.string :sport
      t.boolean :approved
      t.timestamps
    end
  end
end
