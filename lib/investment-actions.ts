"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvestment(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const name = formData.get("name");
  const symbol = formData.get("symbol");
  const investmentTypeId = formData.get("investmentTypeId");
  const initialAmount = formData.get("initialAmount");
  const initialQuantity = formData.get("initialQuantity");
  const purchaseDate = formData.get("purchaseDate");
  const currency = formData.get("currency") || "USD";

  if (
    !name ||
    !investmentTypeId ||
    !initialAmount ||
    !initialQuantity ||
    !purchaseDate
  ) {
    return { error: "All required fields must be filled" };
  }

  const amount = Number(initialAmount);
  const quantity = Number(initialQuantity);
  const pricePerUnit = amount / quantity;

  try {
    // 1️⃣ Insert ke investments dan ambil id
    const { data: investmentData, error: investmentError } = await supabase
      .from("investments")
      .insert({
        user_id: user.id,
        investment_type_id: Number(investmentTypeId),
        name: name.toString(),
        symbol: symbol?.toString() || null,
        initial_amount: amount,
        initial_quantity: quantity,
        initial_price_per_unit: pricePerUnit,
        currency: currency.toString(),
        purchase_date: purchaseDate.toString(),
      })
      .select("id") // ambil id investasi
      .single();

    if (investmentError) {
      console.error("Database error:", investmentError);
      return { error: "Failed to create investment" };
    }

    // 2️⃣ Insert transaksi pertama (initial buy)
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        investment_id: investmentData.id,
        transaction_type: "buy",
        quantity: quantity,
        price_per_unit: pricePerUnit,
        total_amount: amount,
        transaction_date: purchaseDate.toString(),
        notes: "Initial purchase",
      });

    if (transactionError) {
      console.error("Transaction insert error:", transactionError);
      return { error: "Investment created but failed to log transaction" };
    }

    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard/portfolio");
    return { success: "Investment and transaction created successfully" };
  } catch (error) {
    console.error("Error creating investment:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function addTransaction(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const investmentId = formData.get("investmentId");
  const transactionType = formData.get("transactionType");
  const quantity = formData.get("quantity");
  const pricePerUnit = formData.get("pricePerUnit");
  const transactionDate = formData.get("transactionDate");
  const notes = formData.get("notes");

  if (
    !investmentId ||
    !transactionType ||
    !quantity ||
    !pricePerUnit ||
    !transactionDate
  ) {
    return { error: "All required fields must be filled" };
  }

  const qty = Number.parseFloat(quantity.toString());
  const price = Number.parseFloat(pricePerUnit.toString());
  const totalAmount = qty * price;

  try {
    const { error } = await supabase.from("transactions").insert({
      investment_id: Number.parseInt(investmentId.toString()),
      transaction_type: transactionType.toString() as "buy" | "sell",
      quantity: qty,
      price_per_unit: price,
      total_amount: totalAmount,
      transaction_date: transactionDate.toString(),
      notes: notes?.toString() || null,
    });

    if (error) {
      console.error("Database error:", error);
      return { error: "Failed to add transaction" };
    }

    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard/portfolio");
    return { success: "Transaction added successfully" };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteInvestment(investmentId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // First delete all transactions for this investment
    await supabase
      .from("transactions")
      .delete()
      .eq("investment_id", investmentId);

    // Then delete the investment
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", investmentId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to delete investment");
    }

    revalidatePath("/dashboard/analytics");
    revalidatePath("/dashboard/portfolio");
  } catch (error) {
    console.error("Error deleting investment:", error);
    throw error;
  }
}
