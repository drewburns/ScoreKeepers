class User < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged
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

  def has_favorite_team(team)
    contains = false
    if self.teams.include?(team)
      contains = true
    else
      contains = false
    end
    return contains
  end

  def vote_status_on(team,rating_name)
    record = team.evaluations.where(reputation_name: rating_name, source_id: self.id)
    status = nil
    if record.count == 0 or record.first.value == 0.0
      status = nil
    elsif record.first.value == 1.0
      status = "approve"
    elsif record.first.value == -1.0
      status = "disapprove"
    end
    return status
  end

  def team_posts(team_id)
    team = Team.find(team_id)
    return team.posts.where(user_id: self.id)
  end

  def this_weeks_score_team(team_id) 
    team = Team.find(team_id)
    posts = team.posts.where('posts.created_at >= ?', 1.week.ago).where(user_id: self.id)
    scores = posts.map{|post| post.score}.inject{|sum, post| sum + post}
    if scores == nil
      return 0
    else
      return scores
    end
  end


	def this_weeks_score
		posts = self.posts.where('created_at >= ?', 1.week.ago)
		scores = posts.map{|post| post.score}.inject{|sum, post| sum + post}
    if scores == nil
      return 0
    else
		  return scores
    end
	end

  def this_weeks_score_sport(sport)
    posts = self.posts.where('created_at >= ?', 1.week.ago).where(sport: sport)
    scores = posts.map{|post| post.score}.inject{|sum, post| sum + post}

    if scores == nil
      return 0
    else
      return scores
    end
  end

  def full_size
    if self.picture.url == nil
      return 'https://www.communitylandtrust.ca/wp-content/uploads/2015/10/placeholder.png'
    else
      return self.picture.url
    end
  end

  def thumbnail
    if self.picture.url == nil 
      return 'https://www.communitylandtrust.ca/wp-content/uploads/2015/10/placeholder.png'
    else
      return self.picture.thumbnail.url
    end
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
