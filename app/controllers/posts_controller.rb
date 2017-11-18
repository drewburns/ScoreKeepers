class PostsController < ApplicationController
  # before_action :require_login , only: [:create]
  before_action :authenticate_user!, only: %i[create new]
  # before_action :correct_user!, only: [:create,:edit,:update,:destroy]

  def index
    users = []
    User.all.each do |user|
      users << user if user.posts.count > 0
    end
    @users = users.sort_by { |author| author.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)

    if params[:page].nil? || (params[:page].to_i == 1)
      @posts = Post.where(status: 'approved').last(9).reverse
    else
      page = params[:page].to_i
      @posts = Post.where(status: 'approved').order(:created_at).reverse_order.limit(10).offset(page * 10)
    end
  end

  def edit
    @post = Post.find(params[:id])
  end

  def show
    @post = Post.find(params[:id])
    users = []
    User.all.each do |user|
      users << user if user.posts.count > 0
    end
    @users = users.sort_by { |author| author.posts.where('created_at >= ?', 1.week.ago).map(&:score).inject { |sum, post| sum + post } }.reverse.first(5)
  end

  def reject
    @post = Post.find(params[:id])
    new_params = real_post_params
    new_params[:time_approved] = DateTime.now if real_post_params[:status] == 'approved'
    new_params[:time_submitted] = DateTime.now if real_post_params[:status] == 'submitted'

    if @post.update_attributes(new_params)
      redirect_to @post, notice: 'Post Saved!'
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
    # finish making this create the teams right
    puts "UPDATE " * 10
    @post = Post.find(params[:id])
    new_params = real_post_params
    new_params[:time_approved] = DateTime.now if post_params[:status] == 'approved'
    new_params[:time_submitted] = DateTime.now if post_params[:status] == 'submitted'
    p '---------------------------'
    p post_params

    if @post.update_attributes(new_params)
      redirect_to @post, notice: 'Post Saved!'
    else
      redirect_to 'users/creator', alert: 'Please retry'
     end
  end

  def create
    if post_params[:exists] == 'true'
      @post = Post.find(params[:id])
      new_params = real_post_params
      new_params[:time_approved] = DateTime.now if post_params[:status] == 'approved'
      new_params[:time_submitted] = DateTime.now if post_params[:status] == 'submitted'

      if @post.update_attributes(new_params)
        redirect_to @post, notice: 'Post Updated!'
      else
        redirect_to 'users/creator', alert: 'Please retry'
      end
    end
    puts 'PICUTRE'
    puts params[:picture]
    puts 'PICTURE'
    @post = Post.new(real_post_params)
    p post_params
    p params
    if @post.user_id == current_user.id
      if @post.save
        if post_params[:teams] != ""
          teams_list = post_params[:teams].split(",")
          teams_list.each do |team_string|
            team = Team.where(name:team_string)
            if team.first != nil
              PostTeam.create(post_id: @post.id, team_id: team.first.id)
            end
          end

        end
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
    if params[:user_id]
      @value = params[:type] == 'up' ? 1 : 0
      add_value = @value == 1 ? 1 : -1
      puts 'ADD VALUE ' + add_value.to_s
      @post = Post.find(params[:id])
      @user = User.find(params[:user_id])
      @new_score = params[:old_score].to_i + add_value

      if @user && @post
        @post.add_or_update_evaluation(:votes, @value, @user)
        render file: 'posts/vote.js.erb'
        puts '------------------'
        puts 'new score ' + @new_score.to_s
        puts 'value ' + @new_score.to_s
        puts 'actualt score ' + @post.score.to_s
        # redirect_back fallback_location: root_path, notice: 'Vote counted'
      else
        render file: 'shared/error.js.erb'
        # redirect_back fallback_location: root_path, alert: 'Error'
      end
    else
      render file: 'shared/error.js.erb'
    end
  end

  def new
    @post = Post.new
  end

  private

  def post_params
    params.require(:post).permit(:user_id, :title, :content, :thumbnail_url, :sport, :status, :time_approved, :admin_message, :teams)
  end

  def real_post_params 
    return {user_id: post_params[:user_id], title: post_params[:title],content: post_params[:content],thumbnail_url: post_params[:thumbnail_url], sport: post_params[:sport],
      status: post_params[:status], time_approved: post_params[:time_approved], admin_message: post_params[:admin_message]}
  end


  def correct_user!
    post = Post.find(params[:id])
    @user = User.find(post.user.id)
    redirect_to(root_url) unless current_user == @user
  end
end
