
namespace :db do
  desc "This task does nothing"
  task :admin do
  User.all.each do |user|
		User.update(admin: false)
	end
  end
end