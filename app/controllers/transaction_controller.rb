class TransactionController < ApplicationController

  def create
    transaction = current_user.build_new_transaction(transaction_params, current_user)
    if transaction.save
      render :json => transaction.to_json
    else
      render :json => transaction.errors.full_messages, :status => :unprocessable_entity
    end
  end

  private

  def transaction_params
    params.require('transaction').permit(:amount)
  end
end
