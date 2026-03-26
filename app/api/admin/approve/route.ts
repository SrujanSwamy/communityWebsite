import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

// WARNING: Never expose this key publicly!
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const generateRandomPassword = (length = 8) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Server configuration error: Supabase URL or Service Role Key is missing.");
    return NextResponse.json(
      { success: false, message: "Server configuration error." },
      { status: 500 }
    );
  }

  // Create a Supabase client with the service role key
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { id } = await req.json();

    // 1. Fetch the applicant's data
    const { data: applicantData, error: fetchError } = await supabaseAdmin
      .from("Applicants")
      .select(
        "name,email_id,phone_no,profession,street,city,state,country,pincode,documents"
      )
      .eq("id", id)
      .single();

    if (fetchError || !applicantData) {
      console.error("Error fetching applicant:", fetchError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch applicant data." },
        { status: 404 }
      );
    }

    // 2. Create the new user in Supabase Auth
    const password = generateRandomPassword();
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: applicantData.email_id,
        password,
        email_confirm: true, // User is confirmed automatically
      });

    if (authError && authError.message !== 'A user with this email address has already been registered') {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { success: false, message: "Failed to create authentication user." },
        { status: 500 }
      );
    }

    // 3. Insert the data into the 'Members' table
    const { error: insertError } = await supabaseAdmin
      .from("Members")
      .insert([applicantData]);

    if (insertError) {
      console.error("Error inserting into Members table:", insertError);
      // Optional: Clean up the created auth user if this step fails and it was newly created
      if (authData?.user) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      }
      return NextResponse.json(
        { success: false, message: "Failed to add user to members list." },
        { status: 500 }
      );
    }

    // 4. Delete the record from the 'Applicants' table
    const { error: deleteError } = await supabaseAdmin
      .from("Applicants")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting from Applicants table:", deleteError);
      // This is not ideal, as the user is already a member.
      // You might want to handle this case differently.
      return NextResponse.json(
        { success: false, message: "Failed to remove applicant record." },
        { status: 500 }
      );
    }

    // 5. Success
    return NextResponse.json({
      success: true,
      message: "Request approved successfully.",
    });
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
