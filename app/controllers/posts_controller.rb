class PostsController < ApplicationController
  # wrap_parameters :post, include: [:user_id, :title, :content , :image_url, :sport ]
  # before_action :require_login , only: [:create]
  before_action :authenticate_user!, only: [:create, :new]
  # before_action :correct_user!, only: [:create,:edit,:update,:destroy]

  def index
    users = []
    User.all.each do |user|
      users << user if user.posts.count > 0
    end
    @users = users.sort_by { |author| author.posts.map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)

    if params[:page].nil? || (params[:page].to_i == 1)
      @posts = Post.where(status: "approved").last(10).reverse
    else
      page = params[:page].to_i
      @posts = Post.where(status: "approved").order(:created_at).reverse_order.limit(10).offset(page * 10)

    end
  end

  def edit 
  	@post = Post.find(params[:id])
  end

  def show
    @post = Post.find(params[:id])
  end

  def reject
  	@post = Post.find(params[:id])
  	new_params = post_params
  	new_params[:time_approved] = DateTime.now if post_params[:status] == "approved"
  	new_params[:time_submitted] = DateTime.now if post_params[:status] == "submitted"
  	p "---------------------------"
  	p post_params


  	if @post.update_attributes(post_params)
      redirect_to @post , notice: 'Post Saved!'
    else
      redirect_to 'users/creator', alert: 'Please retry'
     end
  end

  def search
    if params[:search]
      @posts = Post.search(params[:search]).order('created_at DESC')
    end
  end

  def update
  	@post = Post.find(params[:id])
  	new_params = post_params
  	new_params[:time_approved] = DateTime.now if post_params[:status] == "approved"
  	new_params[:time_submitted] = DateTime.now if post_params[:status] == "submitted"
  	p "---------------------------"
  	p post_params


  	if @post.update_attributes(post_params)
      redirect_to @post , notice: 'Post Saved!'
    else
      redirect_to 'users/creator', alert: 'Please retry'
     end
  end


  def create
    @post = Post.new(post_params)
    if @post.user_id == current_user.id 
	    if @post.save
	      redirect_to post_path(@post), notice: 'Post Created!'
	    else
	      redirect_to 'posts/new', alert: 'Please retry'
	     end
	   else
	   	redirect_to root_path, alert: 'Please login'
	   end
  end

  def sports
    if params[:page].nil? || (params[:page].to_i == 1)
      sport = params[:sport]
      @posts = Post.where(sport: sport).last(10)
    else
      page = params[:page].to_i
      sport = params[:sport]
      @posts = Post.where(sport: sport).order(:created_at).reverse_order.limit(10).offset(page * 10)

    end
  end

  def teams
    if params[:page].nil? || (params[:page].to_i == 1)
      team = params[:sport]
      @posts = team.posts.last(10)
    else
      page = params[:page].to_i
      team = params[:sport]
      @posts = team.posts.reverse.limit(10).offset(page * 10)
    end
  end

  def user
    if params[:page].nil? || (params[:page].to_i == 1)
      user = params[:id]
      @posts = Post.where(user_id: user).last(10)
    else
      page = params[:page].to_i
      user = params[:id]
      @posts = Post.where(user_id: user).order(:created_at).reverse_order.limit(10).offset(page * 10)

    end
  end

  def vote
    value = params[:type] == 'up' ? 1 : -1
    @post = Post.find(params[:id])
    @user = User.find(params[:user_id])
    if @user && @post
      @post.add_or_update_evaluation(:votes, value, @user)
      redirect_back fallback_location: root_path, notice: 'Vote counted'
    else
      redirect_back fallback_location: root_path, alert: 'Error'
    end
  end

  def new
    @post = Post.new
  end

  private

  def post_params
    params.require(:post).permit(:user_id, :title, :content, :thumbnail_url, :sport, :status, :time_approved, :admin_message)
  end

  def correct_user!
		post = Post.find(params[:id])
	  @user = User.find(post.user.id)
    redirect_to(root_url) unless current_user == (@user)
	end
end
