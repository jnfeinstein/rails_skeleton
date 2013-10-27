# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  email      :string(255)      not null
#  password   :string(255)
#  token      :string(255)
#  created_at :datetime
#  updated_at :datetime
#

require 'bcrypt'

class User < ActiveRecord::Base
	include BCrypt

	validates :email, presence: true, :uniqueness => {:case_sensitive => false}
  validates :password, presence: true
  before_create :build_default_associations

  def self.authenticate(user_email, user_password)
    user = User.find_by_email(user_email.downcase)
    user if user && user.password == user_password
  end

  def self.find_by_email(email)
    User.where(:email => email.downcase).first 
  end

  def build_default_associations; end

	def password
	  Password.new(read_attribute(:password))
	end

	def password=(new_password)
    unless new_password.blank?
      write_attribute(:password, Password.create(new_password))
    end
	end

  def token
    Password.new(read_attribute(:token))
  end

  def make_token
    t = SecureRandom.urlsafe_base64
    write_attribute(:token, Password.create(t))
    self.save
    t
  end
end
