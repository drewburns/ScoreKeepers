class Post < ApplicationRecord
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
    picture
  end

  def thumbnail
    picture.thumbnail
  end
end
