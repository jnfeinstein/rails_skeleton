# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  created_at :datetime
#  updated_at :datetime
#  email      :string(255)
#

require 'bcrypt'

class User < ActiveRecord::Base
	include BCrypt

	validates :email, presence: true, uniqueness: true
  validates :password_hash, presence: true


  def self.authenticate(user_email, user_password)
    user = User.find_by_email(user_email)
    user if user.password == user_password
  end

	def password
	  Password.new(self.password_hash)
	end

	def password=(new_password)
	  self.password_hash = Password.create(new_password)
	end
end
