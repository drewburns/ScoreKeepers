class AddTimeSubmittedToPosts < ActiveRecord::Migration[5.1]
  def change
    add_column :posts, :time_submitted , :datetime
  end
end
