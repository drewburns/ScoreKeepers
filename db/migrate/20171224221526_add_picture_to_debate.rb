class AddPictureToDebate < ActiveRecord::Migration[5.1]
  def change
  	add_column :debates, :picture, :string
  end
end
