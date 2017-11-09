class CreatePosts < ActiveRecord::Migration[5.1]
  def change
    create_table :posts do |t|
    	t.belongs_to :user, foreign_key: true
    	t.string :title
    	t.text :content
    	t.string :thumbnail_url
    	t.string :sport
      t.datetime :time_approved
      t.string :status
      t.string :admin_message
      t.timestamps
    end
  end
end
