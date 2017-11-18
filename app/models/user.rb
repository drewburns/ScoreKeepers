class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  validates :email, uniqueness: true
  validates :email, presence: true
  validates :name, presence: true

  validates :bio, presence: true

  mount_uploader :picture, PictureUploader
  validate  :picture_size
  
	has_many :userTeams
	has_many :teams, through: :userTeams
	has_many :posts
  has_many :comments

	def this_weeks_score
		posts = self.posts.where('created_at >= ?', 1.week.ago)
		scores = posts.map{|post| post.score}.inject{|sum, post| sum + post}
		puts "__________"
		puts scores
    if scores == nil
      return 0
    else
		  return scores
    end
	end

  def full_size
    return self.picture
  end

  def thumbnail
    return self.picture.thumbnail
  end

  def picture_size
    if picture.size > 25.megabytes
      redirect_to new_user_registration , :alert => "File too big"
    end
  end

  def drafts
    puts "____________"
    p self.posts.where(status: "draft")
    return self.posts.where(status: "draft")
  end

  def approved
    return self.posts.where(status: "approved")
  end

  def pending
    return self.posts.where(status: "pending")
  end

  def rejected
     return self.posts.where(status: "rejected")
  end

	def self.valid_login?(email, password)
    user = find_by(email: email)
    if user && user.authenticate(password)
      user
    end
  end

  def this_weeks_rank
    users = []
    User.all.each do |user|
      users << user if user.posts.count > 0
    end
    if users.include?(self)
      rank = users.sort_by{|author| author.posts.map{|post| post.score}.inject{|sum,post| sum + post }}.reverse.index(self)
      return rank + 1
    else 
      return "Not ranked"
    end
  end
end
