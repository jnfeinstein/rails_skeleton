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

  has_one :bank, dependent: :destroy, autosave: true, inverse_of: :user
  has_one :bujit, dependent: :destroy, autosave: true, inverse_of: :user
  has_many :transactions, dependent: :destroy, inverse_of: :user
	validates :email, presence: true, uniqueness: true
  validates :password_hash, presence: true
  before_create :build_default_associations
  before_validation :downcase_email

  def self.authenticate(user_email, user_password)
    user = User.find_by_email(user_email.downcase)
    user if user && user.password == user_password
  end

  def build_default_associations
    self.build_bank
    self.build_bujit
  end

  def downcase_email
    self.email = self.email.downcase if self.email.present?
  end

	def password
	  Password.new(self.password_hash)
	end

	def password=(new_password)
	  self.password_hash = Password.create(new_password)
	end

  def added_new_transaction(transaction)
    puts "FISH"
    self.bank.add_amount_to_total(self.bujit.amount - transaction.amount)
  end
end
