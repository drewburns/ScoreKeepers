class PostTeam < ApplicationRecord
	belongs_to :post
  belongs_to :team
end
