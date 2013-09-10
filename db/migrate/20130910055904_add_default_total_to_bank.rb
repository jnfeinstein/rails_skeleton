class AddDefaultTotalToBank < ActiveRecord::Migration
  def change
    change_column :banks, :total, :float, :default => 0
  end
end
