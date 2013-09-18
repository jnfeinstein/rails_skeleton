# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  created_at :datetime
#  updated_at :datetime
#  email      :string(255)
#  password   :string(255)
#  token      :string(255)
#

require 'bcrypt'

class User < ActiveRecord::Base
	include BCrypt

  has_one :bank, dependent: :destroy, autosave: true, inverse_of: :user
  has_one :bujit, dependent: :destroy, autosave: true, inverse_of: :user
  has_many :transactions, dependent: :destroy, inverse_of: :user
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

  def build_default_associations
    self.build_bank
    self.build_bujit
  end

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

  def build_new_transaction(params = [], creator = self)
    new_transaction = self.transactions.build(params)
    new_transaction.creator = creator
    new_transaction
  end

  def do_after_transaction_created(transaction)
    self.bank.apply_new_transaction(transaction)
  end

  def update_bujit(params)
    self.bujit.amount = params[:amount]
    self.bujit.save
  end

  def update_bank(params)
    self.bank.total = params[:total]
    self.bank.save
  end
end
