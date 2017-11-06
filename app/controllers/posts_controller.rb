class PostsController < ApplicationController
	# wrap_parameters :post, include: [:user_id, :title, :content , :image_url, :sport ]
	# before_action :require_login , only: [:create]
	before_action :authenticate_user!, only: :create

	def show
		@post = Post.find(params[:id])
	end

	def index
		users = []
		User.all.each do |user|
			users << user if user.posts.count > 0
		end
    @users = users.sort_by{|author| author.posts.map{|post| post.score}.inject{|sum,post| sum + post }}.reverse.first(5)

		if params[:page] == nil or params[:page].to_i == 1
			@posts = Post.last(10).reverse
		else
			page = params[:page].to_i
			@posts = Post.order(:created_at).reverse_order.limit(10).offset(page*10)

		end

	end

	def search
    if params[:search]
      @posts = Post.search(params[:search]).order("created_at DESC")
    end
	end

	def create
		@post = Post.new(post_params)
		@user = User.find(params[:user_id])
	    if @post.save
	    	redirect_to post_path(@post) , :notice => "Post Created!"
	    else
	    	redirect_to 'posts/new' , :alert => "Please retry"
	    end
	end


	def sports
		if params[:page] == nil or params[:page].to_i == 1
			sport = params[:sport]
			@posts = Post.where(sport: sport).last(10)
		else
			page = params[:page].to_i
			sport = params[:sport]
			@posts = Post.where(sport: sport).order(:created_at).reverse_order.limit(10).offset(page*10)

		end

	end

	def teams
		if params[:page] == nil or params[:page].to_i == 1
			team = params[:sport]
			@posts = team.posts.last(10)
		else
			page = params[:page].to_i
			team = params[:sport]
			@posts = team.posts.reverse.limit(10).offset(page*10)
		end
	end

	def user
		if params[:page] == nil or params[:page].to_i == 1
			user = params[:id]
			@posts = Post.where(user_id: user).last(10)
		else
			page = params[:page].to_i
			user = params[:id]
			@posts = Post.where(user_id: user).order(:created_at).reverse_order.limit(10).offset(page*10)

		end
	end

	def vote
			value = params[:type] == "up" ? 1 : -1
			@post = Post.find(params[:id])
			@user = User.find(params[:user_id])
			if @user && @post
				@post.add_or_update_evaluation(:votes, value, @user)
		  	redirect_back fallback_location: root_path , :notice => "Vote counted"
			else
		 	 	redirect_back fallback_location: root_path, :alert => "Error"
			end

	end

	def new
		@post = Post.new
	end

	# def top

	# end


  private

    def post_params
      params.require(:post).permit(:user_id, :title, :content , :image_url, :sport )
    end

end