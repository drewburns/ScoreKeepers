class Post < ApplicationRecord
  extend FriendlyId
  friendly_id :title, use: :slugged

  has_many :postTeams
  has_many :teams, through: :postTeams
  has_reputation :votes, source: :user, aggregated_by: :sum
  belongs_to :user
  has_many :comments
  validates :title, presence: true
  validates :content, presence: true
  attr_accessor :teams_string

  # validates :picture, presence: true
  mount_uploader :picture, PictureUploader
  validate :picture_size

  def score
    reputation_for(:votes).to_int
  end

  def writer
    user.name
  end

  def writer_id
    user.id
  end

  def comments
    Comment.where(target_type: "Post", target_id: self.id)
  end

  def header_image
    picture
  end

  def score_for(user)
    votes = evaluations.where(source_id: user.id)
    if votes.count == 0
      return nil
    else
      return votes.first.value
    end
  end

  def self.search(search)
    # Title is for the above case, the OP incorrectly had 'name'
    where('title LIKE ?', "%#{search}%")
  end

  def picture_size
    if picture.size > 25.megabytes
      redirect_to new_user_registration, alert: 'File too big'
    end
  end

  def full_size
    if self.picture.url == nil 
      return 'http://shashgrewal.com/wp-content/uploads/2015/05/default-placeholder-300x300.png' 
    else
      picture.url
    end
  end

  def thumbnail
    if self.picture.url == nil 
      return 'http://shashgrewal.com/wp-content/uploads/2015/05/default-placeholder-300x300.png'
    else
      return self.picture.thumbnail
    end
  end
  def thumb_url
    if self.picture.url == nil 
      return 'http://shashgrewal.com/wp-content/uploads/2015/05/default-placeholder-300x300.png'
    else
      return self.picture.thumbnail.url
    end
  end

  def latest_time
    if self.time_approved == nil 
      return self.created_at
    else
      return self.time_approved
    end
  end
end
