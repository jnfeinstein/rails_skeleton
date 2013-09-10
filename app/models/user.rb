# == Schema Information
#
# Table name: users
#
#  id            :integer          not null, primary key
#  created_at    :datetime
#  updated_at    :datetime
#  email         :string(255)
#  password_hash :string(255)
#

require 'bcrypt'

class User < ActiveRecord::Base
	include BCrypt

	validates :email, presence: true, uniqueness: true
  validates :password_hash, presence: true

  has_one :bank, dependent: :destroy, autosave: true, inverse_of: :user

  before_create :build_default_bank

  def self.authenticate(user_email, user_password)
    user = User.find_by_email(user_email)
    user if user && user.password == user_password
  end

  def build_default_bank
    self.build_bank
  end

	def password
	  Password.new(self.password_hash)
	end

	def password=(new_password)
	  self.password_hash = Password.create(new_password)
	end
end
