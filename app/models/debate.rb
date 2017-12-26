class Debate < ApplicationRecord
  extend FriendlyId
  friendly_id :title, use: :slugged
  belongs_to :team
  mount_uploader :picture, PictureUploader
  validate :picture_size


  def comments
  	Comment.where(target_type: "Debate", target_id: self.id)
  end

  def picture_size
    if picture.size > 25.megabytes
      redirect_to new_user_registration, alert: 'File too big'
    end
  end

  def full_size
    picture
  end

  def thumbnail
    if self.picture.url == nil 
      return 'http://drpattydental.com/wp-content/uploads/2017/05/placeholder.png'
    else
      return self.picture.thumbnail.url
    end
  end

end